import api from "@/api/axiosApi"; // ✅ 팀 공통 axios 인스턴스
import { handleApiError } from "@/utills/handleApiError";
import { authStore } from "@/store/authStore";

/** ✅ 카테고리 목록 조회 */
export const fetchStoreCategories = async () => {
  try {
    const res = await api.get("/api/v1/store/category");
    if (!res.data || !Array.isArray(res.data.response)) {
      console.error("서버 응답이 비정상입니다:", res.data);
      throw new Error("비정상적인 카테고리 응답 데이터");
    }
    return res.data.response;
  } catch (error) {
    handleApiError(error, "fetchStoreCategories");
    throw error;
  }
};

/** ✅ 가게 리스트 조회 */
export const fetchStoreList = async () => {
  try {
    const res = await api.get("/api/v1/store");
    return res.data.response?.content || [];
  } catch (error) {
    handleApiError(error, "fetchStoreList");
    throw error;
  }
};

/** ✅ 가게 상세조회 */
export const getStoreDetail = async (storeId) => {
  try {
    const res = await api.get(`/api/v1/store/${storeId}`);
    return res.data.response?.vo;
  } catch (error) {
    handleApiError(error, "getStoreDetail");
    throw error;
  }
};

/** ✅ 내 가게 불러오기 */
export const fetchMyStore = async () => {
  try {
    const savedStoreId = localStorage.getItem("myStoreId");
    if (!savedStoreId) return null;

    const detail = await getStoreDetail(savedStoreId);

    if (detail?.delYn === "Y") {
      console.log("⚠️ delYn=Y (삭제된 가게) → 숨김 상태 유지");
    }

    return detail ?? null;
  } catch (error) {
    handleApiError(error, "fetchMyStore");
    localStorage.removeItem("myStoreId");
    return null;
  }
};

/** ✅ 가게 등록 (POST) */
export const createStore = async (formData) => {
  try {
    const res = await api.post("/api/v1/store", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (res.data.resultCode !== "200") {
      throw new Error(res.data.message || "가게 등록 실패");
    }

    // 등록 후 가장 최근 storeId 저장
    const list = await fetchStoreList();
    const latest = list.reduce((prev, curr) =>
      curr.storeId > prev.storeId ? curr : prev
    );

    if (latest?.storeId) {
      localStorage.setItem("myStoreId", latest.storeId);
      console.log("신규 등록된 가게 storeId 저장:", latest.storeId);
    }

    return res.data;
  } catch (error) {
    handleApiError(error, "createStore");
    throw error;
  }
};

/** ✅ 가게 수정 (PUT) */
export const updateStore = async (formData) => {
  try {
    const res = await api.put("/api/v1/store", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (res.data.resultCode !== "200") {
      throw new Error(res.data.message || "가게 수정 실패");
    }
    return res.data;
  } catch (error) {
    handleApiError(error, "updateStore");
    throw error;
  }
};

/** ✅ 가게 삭제 (소프트 삭제, delYn='Y') */
export const removeStore = async (storeId) => {
  try {
    const formData = new FormData();
    formData.append("storeId", storeId);
    formData.append("delYn", "Y");

    const res = await api.put("/api/v1/store", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (res.data.resultCode !== "200") {
      throw new Error(res.data.message || "가게 삭제(숨김) 실패");
    }

    localStorage.removeItem("myStoreId");
    console.log("🗑 가게 delYn=Y 처리 완료 (soft delete)");

    return res.data;
  } catch (error) {
    handleApiError(error, "removeStore");
    throw error;
  }
};
