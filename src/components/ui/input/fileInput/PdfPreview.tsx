import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PdfPreviewProps {
  file: string | File;
}

const PdfPreview: React.FC<PdfPreviewProps> = ({ file }) => (
  <Document file={file} className="document-container flex justify-center">
    <Page pageNumber={1} width={200} height={200} className="document-container-page" />
  </Document>
);

export default PdfPreview;