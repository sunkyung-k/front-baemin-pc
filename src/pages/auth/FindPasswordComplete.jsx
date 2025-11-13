import React from "react";
import CompleteMessage from "../../components/common/CompleteMessage";

/**
 * FindPasswordComplete
 * ------------------------------------------------------------
 * - 비밀번호 찾기 완료 안내 페이지
 * - 사용자가 아이디/이메일로 메일 발송 후 이동
 * - 일정 시간 후 로그인 페이지로 자동 이동
 */
export default function FindPasswordComplete() {
  return (
    <CompleteMessage
      title="비밀번호 재설정 메일이 전송되었습니다."
      description={`입력하신 이메일로 비밀번호 재설정 링크가 발송되었습니다.
        이메일을 확인하시고, 안내에 따라 새 비밀번호를 설정해주세요.`}
      redirectPath="/login"
      redirectDelay={5}
      subText="로그인 페이지로 이동합니다."
    />
  );
}
