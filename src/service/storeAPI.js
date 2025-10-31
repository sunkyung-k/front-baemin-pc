import api from "@/api/axiosApi";
import { handleApiError } from "@/utills/handleApiError";
import { authStore } from "@/store/authStore";

/** [0] 카테고리 목록 조회 */
export const fetchStoreCategories = async () => {
  try {
    const res = await api.get("/api/v1/store/category");
    return res.data.response;
  } catch (error) {
    handleApiError(error, "fetchStoreCategories");
    throw error;
  }
};

/** [1] 가게 등록 */
export const createStore = async (formData) => {
  try {
    const res = await api.post("/api/v1/store", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("✅ 가게 등록 완료:", res.data);

    // 등록 후 내 storeId 다시 찾아 세팅
    const storeListRes = await api.get("/api/v1/store");
    const list = storeListRes.data.response?.content || [];
    const { userId } = authStore.getState();

    // 내 userId와 연결된 가게”를 정확히 찾기
    const myStore = list.find((s) => s.delYn === "N" && s.ownerId === userId);

    if (myStore) {
      authStore.getState().setStoreId(myStore.storeId);
      console.log(`✅ 내 storeId 저장 완료 (${myStore.storeId})`);
    } else {
      console.warn("⚠️ 새로 등록된 내 가게를 찾을 수 없습니다.");
    }

    return res.data;
  } catch (error) {
    handleApiError(error, "createStore");
    throw error;
  }
};

/** [2] 내 가게 조회 (authStore.storeId 기반 or OWNER fallback) */
export const fetchMyStore = async () => {
  try {
    const { storeId, userRole, userId } = authStore.getState();

    console.log("🧾 [DEBUG] 현재 로그인한 사용자 ID:", userId);
    console.log("🧾 [DEBUG] 현재 authStore.storeId:", storeId);

    // 1️⃣ storeId 있으면 바로 조회
    if (storeId) {
      const res = await api.get(`/api/v1/store/${storeId}`);
      console.log("✅ storeId로 직접 조회 성공:", res.data.response?.vo);
      return res.data.response?.vo ?? null;
    }

    // 2️⃣ storeId 없고 OWNER면 — 내 userId 기준으로 필터링
    if (userRole === "OWNER") {
      console.log("🧩 storeId 없음 → 전체 목록에서 내 가게(userId) 찾기 시도");
      const res = await api.get("/api/v1/store");
      const list = res.data.response?.content || [];

      console.log(`🧩 전체 가게 수: ${list.length}`);
      const myStore = list.find((s) => s.delYn === "N" && s.ownerId === userId);

      if (myStore) {
        console.log(`✅ userId 기반 매칭 성공! 내 storeId=${myStore.storeId}`);
        authStore.setState({ storeId: myStore.storeId });
        return myStore;
      } else {
        console.warn("⚠️ userId 매칭되는 가게를 찾지 못함 (ownerId 누락 가능)");
      }
    }

    console.warn("⚠️ 등록된 가게를 찾을 수 없습니다.");
    return null;
  } catch (error) {
    handleApiError(error, "fetchMyStore");
    return null;
  }
};

/** [3] 가게 수정 */
export const updateStore = async (formData) => {
  try {
    const res = await api.put("/api/v1/store", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log("✅ 가게 수정 성공");
    return res.data;
  } catch (error) {
    handleApiError(error, "updateStore");
    throw error;
  }
};

/** [4] 가게 삭제 (Soft Delete - delYn='Y') */
export const removeStore = async (storeId) => {
  try {
    const res = await api.delete(`/api/v1/store/${storeId}`);
    console.log(`✅ 가게 숨김 처리 완료 (storeId=${storeId})`);

    // 프론트 상태에서도 storeId 초기화
    authStore.getState().clearStoreId?.();

    return res.data;
  } catch (error) {
    handleApiError(error, "removeStore");
    throw error;
  }
};

export default {
  fetchStoreCategories,
  createStore,
  fetchMyStore,
  updateStore,
  removeStore,
};
