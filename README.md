# User Information Web Application

This project is a full-stack AWS-based user profile application. It allows users to register, verify their email, sign in, manage profile details, upload a profile image, and sign out securely. Admin users can also view profile records for all users.

## Overview

The application includes:

- A React frontend built with Vite
- AWS Amplify for authentication, API access, and storage integration
- Amazon Cognito for user registration and sign-in
- Amazon S3 for private profile image storage
- Amazon DynamoDB for user profile data
- AWS Lambda and API Gateway for backend APIs

## Main Features

- New user registration with email verification
- Sign-in for existing users
- Confirmation code flow after registration
- Private profile management
- Profile image upload and preview
- Success and error messaging in the UI
- Admin-only view for all saved user profiles

## User Flow

### New User

1. Open the application.
2. Click `Create account`.
3. Enter email, username, and password.
4. Submit the sign-up form.
5. Check email for the verification code.
6. If the email is not in the inbox, check the `Spam` or `Junk` folder.
7. Enter the confirmation code.
8. Return to sign in and log in with the created credentials.

### Existing User

1. Open the application.
2. Enter username and password.
3. Click `Sign In`.
4. View and update profile information.
5. Upload a profile image if needed.
6. Click `Save Profile`.
7. Sign out when finished.

### Admin User

Admin users follow the same sign-in flow as normal users. After signing in, they can also see the `Admin: All Users` section, which lists all saved profile records.

## End-User Documentation

For a user-facing guide that can be shared directly with end users, see [USER_GUIDE.md](/home/devansh.nirmal/projects/aws-excersice/USER_GUIDE.md:1).

## Project Structure

- `frontend/` - React application
- `frontend/src/components/Login.jsx` - Sign-in, sign-up, and confirmation flow
- `frontend/src/App.jsx` - Main authenticated application and profile screen
- `frontend/src/styles.css` - Shared frontend styling
- `backend/` - AWS SAM backend
- `backend/template.yaml` - Infrastructure definition for Cognito, API Gateway, Lambda, DynamoDB, and S3
- `backend/src/saveProfile.js` - Save profile API
- `backend/src/getProfile.js` - Get current user profile API
- `backend/src/getAllProfiles.js` - Admin-only list profiles API

## Architecture

### Frontend

- React with Vite
- AWS Amplify Auth for Cognito sign-in and sign-up
- AWS Amplify API for backend requests
- AWS Amplify Storage for profile image upload and retrieval

### Backend

- AWS SAM for infrastructure and deployment
- API Gateway with Cognito authorization
- Lambda functions for profile operations
- DynamoDB for profile storage
- S3 for private profile images

### Authentication and Authorization

- Cognito User Pool handles user registration and login
- Email is auto-verified through Cognito
- Cognito Identity Pool provides authenticated AWS access
- Admin access is controlled through the Cognito `Admin` group

## Current Application Behavior

- Users register with `email`, `username`, and `password`
- After sign-up, users must enter a verification code sent by email
- Sign-in uses `username` and `password`
- Users can save:
  - Name
  - Gender
  - Date of Birth
  - Height
  - Profile image
- Uploaded images are stored in a private S3 path for the signed-in user
- Profile data is stored in DynamoDB by Cognito user ID
- Admin users can retrieve all profiles through `/admin/profiles`

## Local Development

### Frontend

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open the local Vite URL shown in the terminal.

### Frontend Configuration

Update `frontend/src/aws-exports.js` with your deployed AWS resource values.

Required values include:

- `aws_project_region`
- `aws_user_pools_id`
- `aws_user_pools_web_client_id`
- `aws_cognito_identity_pool_id`
- `aws_user_files_s3_bucket`
- `aws_user_files_s3_bucket_region`
- `aws_api_gateway_url`

## Backend Deployment

Deploy the backend using AWS SAM:

```bash
cd backend
sam build
sam deploy --guided
```

During guided deployment, provide values such as:

- Stack name: `user-profile-backend`
- AWS region: for example `us-east-1`
- Confirm changes before deploy: `Y`
- Allow SAM CLI IAM role creation: `Y`

After deployment, record these outputs:

- Cognito User Pool ID
- Cognito App Client ID
- Cognito Identity Pool ID
- S3 bucket name
- API Gateway endpoint URL

## AWS Resources Created

The SAM template creates:

- Cognito User Pool
- Cognito User Pool Client
- Cognito Identity Pool
- Cognito `Admin` group
- IAM role for authenticated users
- S3 bucket for profile images
- DynamoDB table for profile data
- API Gateway REST API
- Lambda functions for:
  - Save profile
  - Get current profile
  - Get all profiles for admins

## Admin Setup

To give a user admin access:

1. Open the Cognito User Pool in AWS Console.
2. Locate the target user.
3. Add the user to the `Admin` group.

Once added, that user can access the admin profile list in the application.

## API Summary

- `GET /profile`
  Returns the signed-in user's profile.

- `POST /profile`
  Saves the signed-in user's profile.

- `GET /admin/profiles`
  Returns all profiles for users in the `Admin` group only.

## Testing Checklist

After deployment or configuration changes, verify:

1. New user can register successfully.
2. Verification email is received.
3. Spam or junk folder guidance is accurate if email is not immediately visible.
4. Verified user can sign in.
5. User can save profile details.
6. User can upload and view a profile image.
7. Sign-out works correctly.
8. Admin user can see the `Admin: All Users` section.
9. Non-admin user cannot access admin data.

## Troubleshooting

- `User already exists`
  The selected username is already registered. Use a different username or sign in with the existing one.

- Verification code email not received
  Check the `Spam` or `Junk` folder first, then retry after a short wait.

- `Confirmation failed`
  The code may be incorrect or expired.

- `Sign in failed`
  The username or password may be incorrect, or the account may not be confirmed yet.

- Admin data not visible
  Confirm the user has been added to the Cognito `Admin` group.

## Notes

- The current UI is intentionally simple and focused on the main profile workflow.
- Profile images are stored in private user-scoped S3 paths.
- API routes are protected by Cognito authorization.
- The frontend includes a loading spinner during session initialization.
