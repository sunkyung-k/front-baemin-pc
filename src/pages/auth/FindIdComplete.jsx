import React from "react";
import CompleteMessage from "@/components/common/CompleteMessage";

/**
 * FindIdComplete
 * ------------------------------------------------------------
 * - 아이디 찾기 완료 안내 페이지
 * - 사용자가 이메일 입력 후 메일 전송 성공 시 이동
 * - 일정 시간 후 로그인 페이지로 자동 이동
 */
export default function FindIdComplete() {
  return (
    <CompleteMessage
      title="아이디 찾기 메일이 전송되었습니다."
      description={`입력하신 이메일로 회원님의 아이디 정보가 발송되었습니다.
이메일을 확인하시고, 로그인 페이지로 이동해주세요.`}
      redirectPath="/login"
      redirectDelay={5}
      subText="로그인 페이지로 이동합니다."
    />
  );
}
