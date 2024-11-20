const { makeGraphQLRequest } = require("./config");
const { GET_ALL_LOCATIONS, GET_PRODUCTS, SET_QUANTITY } = require("./queries");
const cron = require("node-cron");

// Get all product locations
async function getAllLocations() {
  const query = GET_ALL_LOCATIONS;

  let locationsIDList = [];
  let cursor = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const variables = {
      cursor,
    };
    const response = await makeGraphQLRequest(query, variables);
    const locationsList = response?.data?.locations?.edges || [];
    if (locationsList.length === 0) break;
    for (const location of locationsList) {
      const locationId = location.node.id;
      locationsIDList.push(locationId);
    }
    hasNextPage = response?.data?.locations?.pageInfo?.hasNextPage;
    cursor = response?.data?.locations?.pageInfo?.endCursor;
  }

  if (locationsIDList.length === 0) {
    throw new Error("No product locations found.");
  }

  return locationsIDList;
}

// Get products from a specific vendor and location
async function getProducts(vendor, locationID) {
  const query = GET_PRODUCTS;

  let inventoryItemList = [];
  let cursor = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const variables = {
      cursor,
      vendor: `vendor:${vendor}`,
      locationId: `${locationID}`,
    };
    const response = await makeGraphQLRequest(query, variables);
    const products = response?.data?.products?.edges || [];
    if (products.length === 0) break;

    for (const product of products) {
      const variants = product.node.variants.edges || [];
      for (const variant of variants) {
        const inventoryItemId = variant.node.inventoryItem.id;
        const inventoryQuantity =
          variant.node.inventoryItem.inventoryLevel?.quantities?.[0]?.quantity;

        inventoryItemList.push({
          inventoryItemId: inventoryItemId,
          locationID: locationID,
          inventoryQuantity: inventoryQuantity,
        });
      }
    }

    hasNextPage = response?.data?.products?.pageInfo?.hasNextPage;
    cursor = response?.data?.products?.pageInfo?.endCursor;
  }

  if (inventoryItemList.length === 0) {
    throw new Error(`No products by "${vendor}" found`);
  }

  console.log(
    `There are ${inventoryItemList.length} products to be updated...`
  );
  return inventoryItemList;
}

// Set the quantity of a product
async function setQuantity(quantityInput) {
  const query = SET_QUANTITY;

  let variables = {
    input: {
      name: "available",
      reason: "correction",
      ignoreCompareQuantity: true,
      quantities: [
        {
          inventoryItemId: quantityInput.inventoryItemId,
          locationId: quantityInput.locationID,
          quantity: quantityInput.inventoryQuantity + 1,
        },
      ],
    },
  };

  const response = await makeGraphQLRequest(query, variables);
  const userErrors = response?.data?.inventorySetQuantities?.userErrors;
  if (userErrors?.length > 0) {
    console.error("Errors:", userErrors);
    throw new Error("Failed to update quantity");
  }
  const changes =
    response?.data?.inventorySetQuantities?.inventoryAdjustmentGroup?.changes;
  console.log(
    `${variables.input.quantities[0].inventoryItemId} quantity updated from ${quantityInput.inventoryQuantity} to ${variables.input.quantities[0].quantity}`
  );
  return changes;
}

// Main job execution
async function main() {
  try {
    const vendorName = "Nectar";
    const locationsOutput = await getAllLocations();
    for (const location of locationsOutput) {
      const getProductsOutput = await getProducts(vendorName, location);
      const productPromises = [];
      for (const product of getProductsOutput) {
        productPromises.push(setQuantity(product));
      }
      setQuantityOutputs = await Promise.all(productPromises);
      console.log(
        `Successfully updated the quantity of ${setQuantityOutputs.length} products`
      );
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Run the job initially
main();
// Schedule the job to run at the start of each hour
cron.schedule("0 * * * * ", main);
console.log("Task is scheduled to run hourly");
