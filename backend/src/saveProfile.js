const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const userId = getUserId(event);
    if (!userId) {
      return unauthorizedResponse();
    }

    const item = {
      userId,
      name: body.name || '',
      gender: body.gender || '',
      dob: body.dob || '',
      height: body.height || '',
      imageKey: body.imageKey || 'profile.jpg',
      updatedAt: new Date().toISOString(),
    };

    await db.put({
      TableName: process.env.PROFILE_TABLE,
      Item: item,
    }).promise();

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ message: 'Profile saved', profile: item }),
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
