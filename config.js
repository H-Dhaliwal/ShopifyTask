require("dotenv").config();
const axios = require("axios");
const storeUrl = process.env.STORE_URL;
const accessToken = process.env.SHOPIFY_API_TOKEN;

module.exports = {
  axios,
  storeUrl,
  accessToken,
  makeGraphQLRequest,
};

async function makeGraphQLRequest(query, variables = null) {
  try {
    const response = await axios.post(
      storeUrl,
      {
        query: query,
        variables: variables,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error making GraphQL request:",
      error.response?.data || error.message
    );
    throw error;
  }
}
