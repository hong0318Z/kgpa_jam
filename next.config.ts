import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      // 투고 파일(논문 본문/부록/유사도검사결과/저작권위임서, 각 최대 20MB, 다중 첨부 가능)이
      // Server Action의 기본 1MB 제한을 훌쩍 넘겨서 "Body exceeded 1 MB limit" 에러가 났었다.
      bodySizeLimit: "100mb",
    },
    // src/proxy.ts(전역 인증 가드)를 거치는 요청 본문도 기본 10MB로 제한되어 있어서,
    // 위 serverActions 제한을 올려도 여기서 다시 "Unexpected end of form"으로 잘렸다.
    proxyClientMaxBodySize: "100mb",
  },
};

export default nextConfig;
