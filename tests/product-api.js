import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "20s", target: 5 },
    { duration: "30s", target: 10 },
    { duration: "30s", target: 20 },
    { duration: "10s", target: 0 },
  ],
};

export default function () {
  const response = http.get("http://localhost:8080/products");

  check(response, {
    "HTTP status is 200": (r) => r.status === 200,
  });

  sleep(1);
}
