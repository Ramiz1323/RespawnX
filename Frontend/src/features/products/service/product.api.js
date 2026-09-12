import axios from "axios";

const productApiInstance = axios.create({
    baseURL: "/api/products",
    withCredentials: true,
})

export async function createProduct(formData) {
    const response = await productApiInstance.post("/", formData);
    return response.data;
}

export async function getSellerProducts() {
    const response = await productApiInstance.get("/seller");
    return response.data;
}

export async function getAllProducts() {
    const response = await productApiInstance.get("/");
    return response.data;
}

export async function getProductById(productId) {
    const response = await productApiInstance.get(`/details/${productId}`);
    return response.data;
}

export async function addProductVariant(productId, newProductVariant){
    const formData = new FormData();

    if (newProductVariant.images && Array.isArray(newProductVariant.images)) {
        newProductVariant.images.forEach((image) => {
            const file = image?.file || image;
            if (file) {
                formData.append("images", file);
            }
        });
    }

    formData.append("stock", newProductVariant.stock ?? 0);
    formData.append("priceAmount", newProductVariant.priceAmount);
    if (newProductVariant.priceCurrency) {
        formData.append("priceCurrency", newProductVariant.priceCurrency);
    }
    formData.append("attributes", JSON.stringify(newProductVariant.attributes || {}));

    const response = await productApiInstance.post(`/${productId}/variants`, formData);
    return response.data;
}