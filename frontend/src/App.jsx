import { useEffect, useState } from "react";
import { fetchAuthSession, signOut } from "@aws-amplify/auth";
import Login from "./components/Login";
import { get, post } from "@aws-amplify/api-rest";
import { uploadData, getUrl } from "@aws-amplify/storage";
import "@aws-amplify/ui-react/styles.css";

const initialProfile = {
  name: "",
  gender: "",
  dob: "",
  height: "",
  imageKey: "",
};

function App() {
  const [profile, setProfile] = useState(initialProfile);
  const [user, setUser] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [adminProfiles, setAdminProfiles] = useState([]);
  const [status, setStatus] = useState({ message: "", type: "info" });
  const [toastMessage, setToastMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const setAppStatus = (message, type = "info") => setStatus({ message, type });
  const showToast = (message) => {
    if (!message) return;
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(""), 3500);
  };
  const resetUserState = () => {
    setProfile(initialProfile);
    setImageUrl("");
    setAdminProfiles([]);
    setStatus({ message: "", type: "info" });
  };

  const logout = async () => {
    await signOut();
    localStorage.clear();
    sessionStorage.clear();
    resetUserState();
    setUser(null);
    showToast("You have successfully logged out.");
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await fetchAuthSession();
        if (session && session.userSub) {
          setUser({ userId: session.userSub });
        }
      } catch (error) {
        console.log("No active session");
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (!user) {
      resetUserState();
      return;
    }

    resetUserState();
    setLoading(true);
    fetchProfile();
    fetchAdminProfiles();
  }, [user]);

  const getAuthHeaders = async () => {
    const session = await fetchAuthSession();

    const token = session.tokens?.idToken?.toString();

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  async function fetchProfile() {
    try {
      const headers = await getAuthHeaders();
      const result = await get({
        apiName: "UserProfileApi",
        path: "/profile",
        options: { headers },
      });
      const response = await result.response;
      const body = await response.body.json();
      setProfile(body ? { ...initialProfile, ...body } : initialProfile);

      if (body?.imageKey) {
        const urlResult = await getUrl({
          path: body.imageKey,
          options: {
            expiresIn: 300,
          },
        });

        setImageUrl(urlResult.url.toString());
      } else {
        setImageUrl("");
      }
    } catch (error) {
      console.warn("No profile yet", error);
      setProfile(initialProfile);
      setImageUrl("");
    } finally {
      setLoading(false);
    }
  }

  async function fetchAdminProfiles() {
    try {
      const headers = await getAuthHeaders();
      const result = await get({
        apiName: "UserProfileApi",
        path: "/admin/profiles",
        options: { headers },
      });
      const response = await result.response;
      const body = await response.body.json();
      setAdminProfiles(body || []);
    } catch (error) {
      console.warn("Admin profile list unavailable", error);
    }
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfile = async () => {
    try {
      const headers = await getAuthHeaders();

      const result = await post({
        apiName: "UserProfileApi",
        path: "/profile",
        options: {
          headers,
          body: profile,
        },
      });

      const response = await result.response;
      const data = await response.body.json();

      console.log(data);
      setAppStatus("Profile saved successfully.", "success");

      try {
        await fetchProfile();
      } catch (error) {
        console.warn("Saved, but failed to refresh profile", error);
      }
    } catch (error) {
      console.error("SAVE PROFILE ERROR:", error);
      setAppStatus("Unable to save profile.", "error");
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const userId = user?.userId || user?.username;

      const imagePath = `private/${userId}/profile.jpg`;

      await uploadData({
        path: imagePath,
        data: file,
        options: {
          contentType: file.type,
        },
      }).result;

      setProfile((prev) => ({
        ...prev,
        imageKey: imagePath,
      }));

      const urlResult = await getUrl({
        path: imagePath,
        options: {
          expiresIn: 300,
        },
      });

      setImageUrl(urlResult.url.toString());

      setAppStatus("Image uploaded successfully.", "success");
    } catch (error) {
      console.error(error);
      setAppStatus("Image upload failed.", "error");
    }
  };
  return (
    <>
      {loading ? (
        <LoadingScreen />
      ) : !user ? (
        <>
          <Login
            onSignIn={(u) => {
              setUser(u);
            }}
          />
          {toastMessage && (
            <div className="toast toast-success">{toastMessage}</div>
          )}
        </>
      ) : (
        <AppContent
          authUser={user}
          authSignOut={logout}
          setUser={setUser}
          profile={profile}
          setProfile={setProfile}
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          adminProfiles={adminProfiles}
          status={status}
          setStatus={setStatus}
          handleChange={handleChange}
          saveProfile={saveProfile}
          handleImageUpload={handleImageUpload}
        />
      )}
    </>
  );
}

function LoadingScreen() {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <div className="loading-spinner" aria-hidden="true" />
    </div>
  );
}

function AppContent({
  authUser,
  authSignOut,
  setUser,
  profile,
  setProfile,
  imageUrl,
  setImageUrl,
  adminProfiles,
  status,
  setStatus,
  handleChange,
  saveProfile,
  handleImageUpload,
}) {
  useEffect(() => {
    if (authUser) {
      setUser(authUser);
    }
  }, [authUser, setUser]);

  return (
    <main className="page-shell">
      <div className="page-card">
        <div className="header">
          <h1>User Profile Manager</h1>
          <div>
            <span>{authUser?.username || authUser?.attributes?.email}</span>
            <button
              onClick={async () => {
                await authSignOut();
              }}
              style={{
                backgroundColor: "#4b6f94",
              }}
            >
              Sign Out
            </button>
          </div>
        </div>

        <section className="card">
          <h2>My Profile</h2>
          <div className="field-row">
            <label>Name</label>
            <input name="name" value={profile.name} onChange={handleChange} />
          </div>
          <div className="field-row">
            <label>Gender</label>
            <select
              name="gender"
              value={profile.gender}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="field-row">
            <label>Date of Birth</label>
            <input
              name="dob"
              type="date"
              value={profile.dob}
              onChange={handleChange}
            />
          </div>
          <div className="field-row">
            <label>Height (cm)</label>
            <input
              name="height"
              type="number"
              value={profile.height}
              onChange={handleChange}
            />
          </div>
          <div className="field-row">
            <label>Profile Image</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </div>
          {imageUrl && (
            <div className="image-preview">
              <img src={imageUrl} alt="Profile" />
            </div>
          )}
          <button
            onClick={saveProfile}
            style={{
              backgroundColor: "#4b6f94",
            }}
          >
            Save Profile
          </button>
          {status.message && (
            <p className={`status status-${status.type}`}>{status.message}</p>
          )}
        </section>

        {adminProfiles.length > 0 && (
          <section className="card">
            <h2>Admin: All Users</h2>
            <table>
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>DOB</th>
                  <th>Height</th>
                </tr>
              </thead>
              <tbody>
                {adminProfiles.map((item) => (
                  <tr key={item.userId}>
                    <td>{item.userId}</td>
                    <td>{item.name}</td>
                    <td>{item.gender}</td>
                    <td>{item.dob}</td>
                    <td>{item.height}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </main>
  );
}

export default App;
