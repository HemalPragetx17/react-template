import { useState } from "react";
import { toast } from "react-toastify";
import { Button, TextEditor } from "../../../components/ui";

const defaultTerms = `<h1>Terms & Conditions</h1>
<p>Welcome to our platform. Please read these Terms & Conditions carefully before using our services.</p>
<h3>1. Acceptance of Terms</h3>
<p>By accessing or using our services, you agree to be bound by these terms. If you do not agree, you must not use our platform.</p>
<h3>2. User Responsibilities</h3>
<p>You are responsible for keeping your account secure and for all activity that occurs under your account. You agree not to use the services for any illegal or unauthorized purposes.</p>
<h3>3. Intellectual Property</h3>
<p>All content, branding, designs, and code are the exclusive property of our company. You may not copy, distribute, or modify our property without express consent.</p>
<h3>4. Limitation of Liability</h3>
<p>We are not liable for any indirect, incidental, or consequential damages arising from your use of the services.</p>
<p><em>Last updated: June 2026</em></p>`;

const TermsAndCondition = () => {
  const [content, setContent] = useState(defaultTerms);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Terms & Conditions updated successfully!");
    }, 800);
  };

  return (
    <section>
      <div className="flex justify-between items-center">
        <p className="text-2xl">Terms & Conditions</p>
        <Button onClick={handleSave} isLoading={isSaving}>
          Save Changes
        </Button>
      </div>

      <div className="my-5">
        <TextEditor
          value={content}
          onChange={setContent}
          placeholder="Edit Terms and Conditions here..."
          className="shadow-sm"
        />
      </div>
    </section>
  );
};

export default TermsAndCondition;
