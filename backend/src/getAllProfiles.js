const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  };
}

exports.handler = async (event) => {
  try {
    const claims = event.requestContext?.authorizer?.jwt?.claims || event.requestContext?.authorizer?.claims;
    if (!isAdmin(claims)) {
      return {
        statusCode: 403,
        headers: corsHeaders(),
        body: JSON.stringify({ message: 'Admin access required' }),
      };
    }

    const result = await db.scan({ TableName: process.env.PROFILE_TABLE }).promise();
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify(result.Items || []),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ message: 'Server error', error: error.message }),
    };
  }
};

function isAdmin(claims) {
  const groups = claims?.['cognito:groups'] || claims?.['groups'];
  if (!groups) {
    return false;
  }
  if (Array.isArray(groups)) {
    return groups.includes('Admin');
  }
  return typeof groups === 'string' && groups.split(',').includes('Admin');
}
