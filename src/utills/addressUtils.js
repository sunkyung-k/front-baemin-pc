import { KAKAO_API_KEY, KAKAO_API_URL } from "@/config/kakao";

export async function getAddressFromCoords(longitude, latitude) {
  try {
    const res = await fetch(`${KAKAO_API_URL}?x=${longitude}&y=${latitude}`, {
      headers: {
        Authorization: `KakaoAK ${KAKAO_API_KEY}`,
      },
    });

    const data = await res.json();
    if (!data.documents?.length) return "주소 정보를 찾을 수 없습니다.";

    const address =
      data.documents[0].road_address?.address_name ||
      data.documents[0].address?.address_name;

    return address || "주소를 불러올 수 없습니다.";
  } catch (err) {
    console.error("[getAddressFromCoords] 주소 변환 실패:", err);
    return "주소 변환 실패";
  }
}
