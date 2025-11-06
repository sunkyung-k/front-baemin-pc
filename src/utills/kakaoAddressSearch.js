// ✅ 실제 카카오 주소검색 로직
export const openKakaoAddressSearch = (onComplete) => {
  if (!window.daum || !window.daum.Postcode) {
    alert("카카오 주소검색 API가 로드되지 않았습니다.");
    return;
  }

  new window.daum.Postcode({
    oncomplete: (data) => {
      const address = data.roadAddress || data.address;
      if (onComplete) onComplete(address);
    },
  }).open();
};
