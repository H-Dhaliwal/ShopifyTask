const { makeGraphQLRequest } = require("./config");
const { GET_PRODUCT_ID, UPDATE_METAFIELD } = require("./queries");

// Get the Product ID by Title
async function getProductID(productTitle) {
  const query = GET_PRODUCT_ID;
  const variables = {
    productTitle,
  };
  const response = await makeGraphQLRequest(query, variables);
  const productID = response?.data?.products?.edges[0]?.node?.id;
  const productTitleRecieved = response?.data?.products?.edges[0]?.node?.title;
  if (!productID) {
    throw new Error("Product ID not found for the given title.");
  }
  console.log("Product ID:", productID, "Product Title", productTitleRecieved);
  return productID;
}

// Update the Metafield Value
async function updateMetafield(productID, namespace, key, value, type) {
  const mutation = UPDATE_METAFIELD;
  const variables = {
    productID,
    namespace,
    key,
    value,
    type,
  };
  const response = await makeGraphQLRequest(mutation, variables);
  const userErrors = response?.data?.productUpdate?.userErrors;
  if (userErrors?.length > 0) {
    console.error("Errors:", userErrors);
    throw new Error("Failed to update the metafield.");
  }
  const new_firmness =
    response?.data?.productUpdate?.product?.metafields?.edges[0].node.value;
  console.log(
    `Successfully updated metafield '${key}' for product '${productID}' from '${value}' to '${new_firmness}'`
  );
}

// Main function to execute the task
async function main() {
  try {
    const productTitle = "Ala Artemis - 3280 - Harvey";
    const productID = await getProductID(productTitle);
    const namespace = "custom";
    const key = "firmness";
    const value = "Extra Firm";
    const type = "single_line_text_field";
    await updateMetafield(productID, namespace, key, value, type);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();