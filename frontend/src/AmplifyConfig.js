import { Amplify } from 'aws-amplify';
import config from './aws-exports';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: config.aws_user_pools_id,
      userPoolClientId: config.aws_user_pools_web_client_id,
      identityPoolId: config.aws_cognito_identity_pool_id,
      region: config.aws_cognito_region,
      mandatorySignIn: true,
      authenticationFlowType: 'USER_SRP_AUTH',
    },
  },
  Storage: {
    S3: {
      bucket: config.aws_user_files_s3_bucket,
      region: config.aws_user_files_s3_bucket_region,
    },
  },
  API: {
    REST: {
      UserProfileApi: {
        endpoint: config.api_gateway_endpoint,
        region: config.aws_project_region,
      },
    },
  },
});
