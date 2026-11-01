import axios from "axios";

export const globalApi = axios.create({
	baseURL: "/api",
	withCredentials: true,
});

// const refreshApi = axios.create({
// 	baseURL: "/api/auth",
// 	withCredentials: true,
// });

// globalApi.interceptors.response.use(
// 	(response) => {
// 		return response;
// 	},
// 	async (error) => {
// 		// console.log("🔥 Interceptor hit");
// 		const originalRequest = error.config;
// 		if (originalRequest.url?.includes("/auth/refresh")) {
// 			return Promise.reject(error);
// 		}

// 		if (!error.response) {
// 			return Promise.reject(error);
// 		}
// 		if (
// 			error.response?.status === 401 &&
// 			!originalRequest._retry &&
// 			!originalRequest.url?.includes("/refresh")
// 		) {
// 			originalRequest._retry = true;

// 			try {
// 				// console.log("Refreshing token...");
// 				await refreshApi.post("/refresh");
// 				return globalApi(originalRequest);
// 			} catch (error) {
// 				return Promise.reject(error);
// 			}
// 		}
// 		return Promise.reject(error);
// 	},
// );

export default globalApi;