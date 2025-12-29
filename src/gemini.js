const MODEL_NAME = 'gemini-2.5-flash'
const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`
const FALLBACK_API_KEY = 'AIzaSyAF4D_62LH3qQ1q_X4ePi-Hl3CHFmwsahs'

const PROMPT =
    "i give a pdf document, you will make the website same as pdf document. provide html code in your response. do not provide any explanation or other text. make sure to include inline css styles within the html code. preserve the layout, fonts, colors, and images as closely as possible to the original pdf document. make text editable.give same structure and appearance as pdf document. do not wrap with any other html tags.make texteditable using contenteditable='true' attribute."

const arrayBufferToBase64 = (buffer) => {
    if (typeof Buffer !== 'undefined') {
        return Buffer.from(buffer).toString('base64')
    }

    const bytes = new Uint8Array(buffer)
    const chunkSize = 0x8000
    let binary = ''

    for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize)
        binary += String.fromCharCode(...chunk)
    }

    if (typeof window !== 'undefined' && typeof btoa === 'function') {
        return btoa(binary)
    }

    throw new Error('Base64 conversion is not supported in this environment.')
}

const extractTextFromResponse = (payload) => {
    const candidate = payload?.candidates?.find((item) => item?.content?.parts?.length)
    if (!candidate) return ''
    return (
        candidate.content.parts
            ?.map((part) => part.text)
            .filter(Boolean)
            .join('\n') || ''
    ).trim()
}

const resolveApiKey = () => {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) {
        return import.meta.env.VITE_GEMINI_API_KEY
    }

    if (typeof process !== 'undefined' && process.env?.VITE_GEMINI_API_KEY) {
        return process.env.VITE_GEMINI_API_KEY
    }

    return FALLBACK_API_KEY
}

export const generateWebsiteFromPdf = async (pdfBuffer) => {
    if (!pdfBuffer) throw new Error('PDF data missing. Please upload a document first.')
    const apiKey = resolveApiKey()
    if (!apiKey) throw new Error('Gemini API key missing. Set VITE_GEMINI_API_KEY.')

    const body = JSON.stringify({
        contents: [
            {
                role: 'user',
                parts: [
                    { text: PROMPT },
                    {
                        inlineData: {
                            mimeType: 'application/pdf',
                            data: arrayBufferToBase64(pdfBuffer),
                        },
                    },
                ],
            },
        ],
    })

    const response = await fetch(`${API_ENDPOINT}?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body,
    })

    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
        const message = payload?.error?.message || 'Gemini request failed. Please try again.'
        throw new Error(message)
    }

    const text = extractTextFromResponse(payload)
    if (!text) {
        throw new Error('Gemini returned an empty response.')
    }
    console.log('Gemini response text:', text)
    return text
}

