/**
 * Daum 주소 검색 팝업 (도로명/지번 검색)
 */
export function openDaumPostcode(onSelect) {
  const existing = document.getElementById("daum_postcode_script");
  if (!existing) {
    const script = document.createElement("script");
    script.id = "daum_postcode_script";
    script.src =
      "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.onload = () => {
      new window.daum.Postcode({
        oncomplete: (data) => onSelect(data.address),
      }).open();
    };
    document.body.appendChild(script);
  } else {
    new window.daum.Postcode({
      oncomplete: (data) => onSelect(data.address),
    }).open();
  }
}
