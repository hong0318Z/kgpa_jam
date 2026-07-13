import { requireRole, ADMIN_ROLES } from "@/lib/rbac";
import { getEmailTemplate } from "@/lib/actions/email-templates";
import { EMAIL_TEMPLATE_DEFAULTS } from "@/lib/email-templates/registry";
import { EmailTemplateForm } from "./email-template-form";

export default async function MailAdminPage() {
  await requireRole(ADMIN_ROLES);

  const keys = Object.keys(EMAIL_TEMPLATE_DEFAULTS);
  const templates = await Promise.all(
    keys.map(async (key) => ({
      key,
      label: EMAIL_TEMPLATE_DEFAULTS[key].label,
      ...(await getEmailTemplate(key)),
    })),
  );

  return (
    <div className="w-full max-w-2xl">
      <h1 className="mb-1 text-xl font-bold text-gray-900">메일 관리</h1>
      <p className="mb-6 text-sm text-gray-500">
        발송되는 메일의 제목과 본문 문구를 수정할 수 있습니다. <code>{"{{name}}"}</code>,{" "}
        <code>{"{{loginUrl}}"}</code>는 발송 시 실제 값으로 자동 치환됩니다.
      </p>
      <div className="flex flex-col gap-6">
        {templates.map((t) => (
          <div key={t.key} className="rounded border border-gray-200 bg-white p-6">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">{t.label}</h2>
            <EmailTemplateForm
              templateKey={t.key}
              subject={t.subject}
              bodyHtml={t.bodyHtml}
              defaultSubject={EMAIL_TEMPLATE_DEFAULTS[t.key].subject}
              defaultBodyHtml={EMAIL_TEMPLATE_DEFAULTS[t.key].bodyHtml}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
