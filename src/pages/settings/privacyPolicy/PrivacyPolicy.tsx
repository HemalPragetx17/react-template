import { useState } from "react";
import { toast } from "react-toastify";
import { Button, TextEditor } from "../../../components/ui";

const defaultPolicy = `<h1>Privacy Policy</h1>
<p>We respect your privacy. This policy explains what personal data we collect, why we use it, and how we protect it.</p>
<h3>1. Information We Collect</h3>
<p>We may collect information you provide directly, such as names, email addresses, phone numbers, and company names. We also collect usage statistics like IP addresses and device information automatically.</p>
<h3>2. How We Use Information</h3>
<p>We use your information to operate and improve our services, communicate with you, process payments, and protect against security incidents or fraudulent activities.</p>
<h3>3. Sharing and Disclosures</h3>
<p>We do not sell your personal data. We may share information with trusted third-party service providers (like payment processors and cloud hosting) to deliver our services, or when legally required.</p>
<h3>4. Data Security</h3>
<p>We implement industry-standard administrative, physical, and electronic security measures to safeguard your information from unauthorized access or theft.</p>
<p><em>Last updated: June 2026</em></p>`;

const PrivacyPolicy = () => {
  const [content, setContent] = useState(defaultPolicy);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Privacy Policy updated successfully!");
    }, 800);
  };

  return (
    <section>
      <div className="flex justify-between items-center">
        <p className="text-2xl">Privacy Policy</p>
        <Button onClick={handleSave} isLoading={isSaving}>
          Save Changes
        </Button>
      </div>

      <div className="my-5">
        <TextEditor
          value={content}
          onChange={setContent}
          placeholder="Edit Privacy Policy here..."
          className="shadow-sm"
        />
      </div>
    </section>
  );
};

export default PrivacyPolicy;
