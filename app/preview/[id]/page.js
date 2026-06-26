import { db } from '../../../lib/db';

// Import Templates
import ClassicTemplate from '../../../components/templates/ClassicTemplate';
import ModernTemplate from '../../../components/templates/ModernTemplate';
import TechTemplate from '../../../components/templates/TechTemplate';
import CreativeTemplate from '../../../components/templates/CreativeTemplate';
import FAANGTemplate from '../../../components/templates/FAANGTemplate';
import GoogleTemplate from '../../../components/templates/GoogleTemplate';
import HarvardTemplate from '../../../components/templates/HarvardTemplate';
import StanfordTemplate from '../../../components/templates/StanfordTemplate';
import MITTemplate from '../../../components/templates/MITTemplate';
import MinimalTemplate from '../../../components/templates/MinimalTemplate';
import ElegantTemplate from '../../../components/templates/ElegantTemplate';
import ExecutiveTemplate from '../../../components/templates/ExecutiveTemplate';
import ATSBasicTemplate from '../../../components/templates/ATSBasicTemplate';
import DeveloperTemplate from '../../../components/templates/DeveloperTemplate';
import ProductManagerTemplate from '../../../components/templates/ProductManagerTemplate';
import DesignerTemplate from '../../../components/templates/DesignerTemplate';
import InternshipTemplate from '../../../components/templates/InternshipTemplate';
import AcademicCVTemplate from '../../../components/templates/AcademicCVTemplate';

export default async function PreviewPage({ params }) {
  const { id } = params;
  const resumeData = await db.resumes.findOne({ _id: id });

  if (!resumeData) {
    return <div>Resume not found.</div>;
  }

  const renderTemplate = () => {
    switch (resumeData.template) {
      case 'faang':    return <FAANGTemplate data={resumeData} />;
      case 'google':   return <GoogleTemplate data={resumeData} />;
      case 'harvard':  return <HarvardTemplate data={resumeData} />;
      case 'stanford': return <StanfordTemplate data={resumeData} />;
      case 'mit':      return <MITTemplate data={resumeData} />;
      case 'minimal':  return <MinimalTemplate data={resumeData} />;
      case 'elegant':  return <ElegantTemplate data={resumeData} />;
      case 'executive':return <ExecutiveTemplate data={resumeData} />;
      case 'ats-basic':return <ATSBasicTemplate data={resumeData} />;
      case 'developer':return <DeveloperTemplate data={resumeData} />;
      case 'product-manager': return <ProductManagerTemplate data={resumeData} />;
      case 'designer': return <DesignerTemplate data={resumeData} />;
      case 'internship': return <InternshipTemplate data={resumeData} />;
      case 'academic-cv': return <AcademicCVTemplate data={resumeData} />;
      case 'creative': return <CreativeTemplate data={resumeData} />;
      case 'tech':     return <TechTemplate data={resumeData} />;
      case 'modern':   return <ModernTemplate data={resumeData} />;
      case 'classic':
      default:         return <ClassicTemplate data={resumeData} />;
    }
  };

  return (
    <div 
      id="resume-preview-root"
      style={{
        width: '8.5in',
        minHeight: '11in',
        background: '#fff',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}
    >
      {renderTemplate()}
    </div>
  );
}
