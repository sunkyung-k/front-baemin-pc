/**
 * Daum 주소 검색 팝업 (도로명/지번 검색)
 */
export function openDaumPostcode(onSelect) {
  if (!window.daum || !window.daum.Postcode) {
    console.error("Daum Postcode 스크립트가 로드되지 않았습니다.");
    return;
  }

  new window.daum.Postcode({
    oncomplete: (data) => {
      onSelect(data.address);
    },
  }).open();
}
