import { Amplify } from 'aws-amplify';

const env = import.meta.env;

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: env.VITE_AWS_USER_POOLS_ID,
      userPoolClientId: env.VITE_AWS_USER_POOLS_WEB_CLIENT_ID,
      identityPoolId: env.VITE_AWS_COGNITO_IDENTITY_POOL_ID,
      region: env.VITE_AWS_COGNITO_REGION,
      mandatorySignIn: true,
      authenticationFlowType: 'USER_SRP_AUTH',
    },
  },
  Storage: {
    S3: {
      bucket: env.VITE_AWS_USER_FILES_S3_BUCKET,
      region: env.VITE_AWS_USER_FILES_S3_BUCKET_REGION,
    },
  },
  API: {
    REST: {
      UserProfileApi: {
        endpoint: env.VITE_API_GATEWAY_ENDPOINT,
        region: env.VITE_AWS_PROJECT_REGION,
      },
    },
  },
});
