import { useHandleError } from "@/hooks/common/useHandleError";

/**
 * 공통 삭제 confirm 훅
 * -------------------------------------------------
 * - confirm → API 호출 → 성공 alert (옵션)
 * - onSuccess 콜백으로 refetch 등 후처리 가능
 * - useHandleError 훅을 이용해 에러 콘솔/알림 일원화
 */
export const useConfirmDelete = () => {
  const handleError = useHandleError();

  /**
   * @param {Function} deleteFn   실제 삭제 실행 함수
   * @param {string} context      에러 로그용 컨텍스트
   * @param {object} options      { showSuccessAlert?: boolean, onSuccess?: Function }
   * @returns {Promise<{ success: boolean, data?: any, error?: any }>}
   */
  const handleDelete = async (deleteFn, context = "", options = {}) => {
    const { showSuccessAlert = true, onSuccess } = options;

    const confirmed =
      typeof window !== "undefined"
        ? window.confirm("정말 삭제하시겠습니까?")
        : false;
    if (!confirmed) return { success: false };

    try {
      const data = await deleteFn();

      if (onSuccess) onSuccess(data);

      if (showSuccessAlert && typeof window !== "undefined") {
        alert("삭제되었습니다.");
      }

      return { success: true, data };
    } catch (err) {
      const msg = handleError(err, context || "useConfirmDelete.handleDelete");
      if (msg && typeof window !== "undefined") {
        alert(msg);
      }
      return { success: false, data: null, error: err };
    }
  };

  return { handleDelete };
};

export default useConfirmDelete;
