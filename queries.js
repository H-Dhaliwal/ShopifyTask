const GET_PRODUCT_ID = `
    query($productTitle: String!) {
      products(first: 1, query: $productTitle) {
        edges {
          node {
            id
            title
          }
        }
      }
    }
  `;

const UPDATE_METAFIELD = `mutation($productID: ID!, $namespace: String!, $key: String!, $value: String!, $type: String!) {
      productUpdate(input: {
        id: $productID,
        metafields: [
        {
          namespace: $namespace,
          key: $key,
          value: $value,
          type: $type
        }
      ]
      }) {
        product {
          id
          metafields(first: 1, namespace: $namespace) {
            edges {
              node {
                key
                value
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }`;

const GET_ALL_LOCATIONS = `query($cursor: String) {
    locations(first: 10, after: $cursor) {
      edges {
        cursor
        node {
          id
          name
          address {
            formatted
          }
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }`;

const GET_PRODUCTS = `query($cursor: String, $vendor: String!, $locationId: ID!) {
    products(first: 10, query: $vendor, after: $cursor) {
      edges {
        cursor
        node {
          variants(first: 1) {
            edges {
              node {
                inventoryItem {
                  id
                  inventoryLevel(locationId: $locationId) {
                    quantities(names: ["available"]) {
                      id
                      quantity
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }`;

const SET_QUANTITY = `mutation InventorySet($input: InventorySetQuantitiesInput!) {
    inventorySetQuantities(input: $input) {
      inventoryAdjustmentGroup {
        createdAt
        reason
        referenceDocumentUri
        changes {
          name
          delta
        }
      }
      userErrors {
        field
        message
      }
    }
  }`;

module.exports = {
  GET_PRODUCT_ID,
  UPDATE_METAFIELD,
  GET_ALL_LOCATIONS,
  GET_PRODUCTS,
  SET_QUANTITY,
};
