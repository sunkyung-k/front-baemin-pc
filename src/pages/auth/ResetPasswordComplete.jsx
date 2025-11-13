import React from "react";
import CompleteMessage from "@/components/common/CompleteMessage";

/**
 * ResetPasswordComplete
 * ------------------------------------------------------------
 * - 비밀번호 재설정 완료 안내 페이지
 * - 사용자가 이메일 링크를 통해 비밀번호 변경 후 이동
 * - 일정 시간 후 로그인 페이지로 자동 이동
 */
export default function ResetPasswordComplete() {
  return (
    <CompleteMessage
      title="비밀번호 재설정이 완료되었습니다."
      description={`새 비밀번호로 로그인해주세요.
로그인 페이지로 이동 후 새 비밀번호로 다시 로그인하실 수 있습니다.`}
      redirectPath="/login"
      redirectDelay={5}
      subText="로그인 페이지로 이동합니다."
    />
  );
}
