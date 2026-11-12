import { ContactForm } from "./contact-form";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-1 text-xl font-bold text-gray-900">문의하기</h1>
      <p className="mb-6 text-sm text-gray-500">
        투고, 심사, 학술대회 등 궁금하신 점을 남겨 주시면 확인 후 답변드리겠습니다.
      </p>
      <ContactForm />
    </div>
  );
}
