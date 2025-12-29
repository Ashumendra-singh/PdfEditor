import React, { useState } from 'react'

// filepath: c:\Users\ashu0\OneDrive\Desktop\ResumeEditor\src\components\Pdfinput.jsx

function PdfInput({ onPdfLoad, isGenerating = false }) {
    const [fileName, setFileName] = useState('')
    const [error, setError] = useState('')

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0]
        setError('')
        if (!file) return
        if (file.type !== 'application/pdf') {
            setError('Please select a PDF file.')
            return
        }
        try {
            const arrayBuffer = await file.arrayBuffer()
            onPdfLoad?.({ buffer: arrayBuffer, name: file.name })
            setFileName(file.name)
        } catch (err) {
            setError('Failed to read the PDF file.')
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: '600' }}>Upload PDF</label>
            <input type="file" accept="application/pdf" onChange={handleFileChange} disabled={isGenerating} />
            {fileName && <span style={{ fontSize: '0.9rem' }}>Selected: {fileName}</span>}
            {error && <span style={{ color: 'red', fontSize: '0.85rem' }}>{error}</span>}
        </div>
    )
}

export default PdfInput