import Quill from "quill";
import "quill/dist/quill.snow.css";
import React, { useEffect, useRef } from "react";
import "./index.css";
import { getRadiusClass } from "../shared/radius";

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  value,
  onChange,
  placeholder = "Write something...",
  className = "",
  readOnly = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const isSelfChanging = useRef(false);

  useEffect(() => {
    if (!containerRef.current || quillRef.current) return;

    // Create container inside ref
    const editorDiv = document.createElement("div");
    containerRef.current.appendChild(editorDiv);

    const quill = new Quill(editorDiv, {
      theme: "snow",
      placeholder,
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }, { size: ["small", false, "large", "huge"] }],
          ["bold", "italic", "underline", "strike"],
          [{ script: "sub" }, { script: "super" }],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          ["blockquote", "code-block"],
          [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
          ["link", "image", "video"],
          ["clean"],
        ],
      },
    });

    quillRef.current = quill;

    // Set initial value
    if (value) {
      quill.root.innerHTML = value;
    }

    // Set dynamic status
    if (readOnly) {
      quill.disable();
    }

    // Set change handler
    quill.on("text-change", () => {
      isSelfChanging.current = true;
      const html = quill.root.innerHTML;
      // If quill editor is empty of text (e.g. only has "<p><br></p>"), send an empty string
      const trimmedHtml = html === "<p><br></p>" ? "" : html;
      onChange(trimmedHtml);
      // Reset after brief timeout to avoid event loop race conditions
      setTimeout(() => {
        isSelfChanging.current = false;
      }, 0);
    });

    return () => {
      // Clean up Quill
      quillRef.current = null;
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, []); // Only run on mount!

  // Update value from parent if changed externally
  useEffect(() => {
    if (quillRef.current && value !== undefined && !isSelfChanging.current) {
      const currentVal = quillRef.current.root.innerHTML;
      if (currentVal !== value && !(value === "" && currentVal === "<p><br></p>")) {
        quillRef.current.root.innerHTML = value;
      }
    }
  }, [value]);

  // Update readOnly prop if changed
  useEffect(() => {
    if (quillRef.current) {
      if (readOnly) {
        quillRef.current.disable();
      } else {
        quillRef.current.enable();
      }
    }
  }, [readOnly]);

  return (
    <div
      ref={containerRef}
      className={`text-editor-container border border-neutral-200 dark:border-neutral-700 ${getRadiusClass()} overflow-hidden ${className}`}
    />
  );
};

export default TextEditor;
