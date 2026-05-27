const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const userId = getUserId(event);
    if (!userId) {
      return unauthorizedResponse();
    }

    const result = await db.get({
      TableName: process.env.PROFILE_TABLE,
      Key: { userId },
    }).promise();

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify(result.Item || {}),
    };
  } catch (error) {
    console.error(error);
    return errorResponse(error);
  }
};

function getUserId(event) {
  return event.requestContext?.authorizer?.jwt?.claims?.sub || event.requestContext?.authorizer?.claims?.sub;
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  };
}

function unauthorizedResponse() {
  return {
    statusCode: 401,
    headers: corsHeaders(),
    body: JSON.stringify({ message: 'Unauthorized' }),
  };
}

function errorResponse(error) {
  return {
    statusCode: 500,
    headers: corsHeaders(),
    body: JSON.stringify({ message: 'Server error', error: error.message }),
  };
}
