import React, { useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import PdfInput from './components/Pdfinput.jsx'
import { generateWebsiteFromPdf } from './gemini.js'

const PdfUploaderScreen = ({ onPdfLoad, isGenerating, errorMessage }) => {
  return (
    <main style={{ padding: '32px', maxWidth: '720px', margin: '0 auto', display: 'grid', gap: '24px' }}>
      <section>
        <p style={{ margin: 0, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '13px' }}>
          Step 1
        </p>
        <h1 style={{ margin: '6px 0 0', fontSize: 'clamp(28px, 4vw, 36px)' }}>Upload your PDF resume</h1>
        <p style={{ color: '#475569', lineHeight: 1.6 }}>
          Select a PDF to kick off the resume editor flow. After the file loads, Gemini will generate an editable snapshot for the
          preview page.
        </p>
      </section>
      <PdfInput onPdfLoad={onPdfLoad} isGenerating={isGenerating} />
      {isGenerating && (
        <div style={{ padding: '12px 16px', borderRadius: '10px', background: '#e0f2fe', color: '#0f172a', fontWeight: 600 }}>
          Sending PDF to Gemini... this can take a few seconds.
        </div>
      )}
      {errorMessage && (
        <div style={{ padding: '12px 16px', borderRadius: '10px', background: '#fee2e2', color: '#991b1b', fontWeight: 600 }}>
          {errorMessage}
        </div>
      )}
    </main>
  )
}

const PreviewScreen = ({ pdfBytes, aiHtml, fileName }) => {
  if (!pdfBytes || !aiHtml) {
    return <Navigate to="/" replace />
  }

  return (
    <main style={{ padding: '32px', maxWidth: '900px', margin: '0 auto', display: 'grid', gap: '18px' }}>
      <section>
        <p style={{ margin: 0, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '13px' }}>
          Step 2
        </p>
        <h1 style={{ margin: '6px 0 0', fontSize: 'clamp(26px, 4vw, 34px)' }}>Preview & edit</h1>
        <p style={{ color: '#475569', lineHeight: 1.6 }}>
          Gemini response stored in state. Tweak the markup below or plug it into your editor workflow.
        </p>
      </section>
      <div
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '18px',
          background: '#f8fafc',
          display: 'grid',
          gap: '12px',
        }}
      >
        <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
          {`Received PDF buffer length: ${pdfBytes.byteLength.toLocaleString()} bytes`}
        </div>
        <div style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '16px', background: '#fff', overflow: 'auto' }}>
          <h2 style={{ marginTop: 0 }}>{fileName || 'Generated resume'}</h2>
          <article dangerouslySetInnerHTML={{ __html: aiHtml }} />
        </div>
      </div>
    </main>
  )
}

function App() {
  const navigate = useNavigate()
  const [pdfBytes, setPdfBytes] = useState(null)
  const [aiHtml, setAiHtml] = useState('')
  const [fileName, setFileName] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handlePdfLoad = async ({ buffer, name }) => {
    setErrorMessage('')
    setIsGenerating(true)
    setPdfBytes(buffer)
    setFileName(name)
    try {
      const responseHtml = await generateWebsiteFromPdf(buffer)
      setAiHtml(responseHtml)
      navigate('/preview')
    } catch (err) {
      console.error(err)
      setAiHtml('')
      setErrorMessage(err.message || 'Failed to generate website preview.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Routes>
      <Route path="/" element={<PdfUploaderScreen onPdfLoad={handlePdfLoad} isGenerating={isGenerating} errorMessage={errorMessage} />} />
      <Route path="/preview" element={<PreviewScreen pdfBytes={pdfBytes} aiHtml={aiHtml} fileName={fileName} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
