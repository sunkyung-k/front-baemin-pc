import { useHandleError } from "@/hooks/common/useHandleError";

/**
 * 삭제 confirm + alert 통합 훅
 * -------------------------------------------------
 * - confirm → API 호출 → alert("삭제되었습니다.")
 * - 성공 메시지는 옵션(showSuccessAlert)으로 제어 가능
 * - 모든 삭제 로직에서 공통 사용 가능
 *
 * @example
 * const { handleDelete } = useConfirmDelete();
 * handleDelete(() => api.deleteCategory(id), "Category.delete", { showSuccessAlert: true });
 */
export const useConfirmDelete = () => {
  const handleError = useHandleError();

  /**
   * @param {Function} deleteFn  실제 삭제 실행 함수
   * @param {string} context     콘솔 로그용 컨텍스트 이름
   * @param {object} options     { showSuccessAlert: boolean }
   * @returns {Promise<{success: boolean, result?: any}>}
   */
  const handleDelete = async (deleteFn, context = "", options = {}) => {
    const { showSuccessAlert = true } = options;

    const confirmed = window.confirm("정말 삭제하시겠습니까?");
    if (!confirmed) return { success: false };

    try {
      const result = await deleteFn();
      if (showSuccessAlert) alert("삭제되었습니다.");
      return { success: true, result };
    } catch (err) {
      handleError(err, context || "handleDelete");
      return { success: false };
    }
  };

  return { handleDelete };
};

export default useConfirmDelete;
