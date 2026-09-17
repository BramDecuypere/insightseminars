'use client'

import { createContext, useContext, useEffect, useRef, type MutableRefObject } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import SignaturePad from 'signature_pad'
import type { RegistrationInput } from '@/lib/registration/schema'
import { ErrorText } from './fields'

/**
 * Teen consent artifacts (brief §7.2): a resize-safe signature_pad canvas with
 * a clear button, or an uploaded signed form (pdf/jpg/png ≤ 4 MB). The signature
 * is stored as a PNG data URL in the form; the uploaded File stays in a ref and
 * is sent separately as a File so it is never base64-inflated. Nothing is stored
 * on the server.
 */

/** Holds the chosen upload File so the form can send it with the submission. */
export const ConsentFileContext = createContext<MutableRefObject<File | null> | null>(null)

export function useConsentFileRef(): MutableRefObject<File | null> {
  const ref = useContext(ConsentFileContext)
  if (!ref) throw new Error('useConsentFileRef must be used within ConsentFileContext')
  return ref
}

const MAX_BYTES = 4 * 1024 * 1024 // 4 MB (brief §7.2)
const ACCEPTED = ['application/pdf', 'image/jpeg', 'image/png']

export function ConsentFields() {
  const t = useTranslations('form.consent')
  const method = useWatch({ name: 'consentMethod' }) as RegistrationInput['consentMethod']

  return (
    <div className="space-y-4">
      {method === 'sign' && <SignatureField />}
      {method === 'upload' && <UploadField />}
      {method === 'sign' && (
        <p className="text-sm text-leisteen">{t('signHint')}</p>
      )}
    </div>
  )
}

function SignatureField() {
  const t = useTranslations('form.consent')
  const { setValue } = useFormContext()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const padRef = useRef<SignaturePad | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const pad = new SignaturePad(canvas, { penColor: '#1e2a33' })
    padRef.current = pad

    // Keep the drawing surface crisp and correctly scaled across resizes.
    const resize = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1)
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * ratio
      canvas.height = rect.height * ratio
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.scale(ratio, ratio)
      pad.clear()
      setValue('consentSignature', '')
    }
    resize()

    const onEnd = () =>
      setValue('consentSignature', pad.toDataURL('image/png'), { shouldValidate: true })
    pad.addEventListener('endStroke', onEnd)
    window.addEventListener('resize', resize)
    return () => {
      pad.removeEventListener('endStroke', onEnd)
      window.removeEventListener('resize', resize)
      pad.off()
      padRef.current = null
    }
  }, [setValue])

  const clear = () => {
    padRef.current?.clear()
    setValue('consentSignature', '', { shouldValidate: true })
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        className="h-40 w-full touch-none rounded-md border border-lijn bg-papier"
        aria-label={t('methodSign')}
      />
      <button
        type="button"
        onClick={clear}
        className="mt-2 rounded-md border border-lijn bg-mist px-3 py-1.5 text-sm font-medium text-inkt hover:bg-papier"
      >
        {t('clear')}
      </button>
      <ErrorText name="consentSignature" />
    </div>
  )
}

function UploadField() {
  const t = useTranslations('form.consent')
  const fileRef = useConsentFileRef()
  const { setValue, setError, clearErrors } = useFormContext()

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) {
      fileRef.current = null
      setValue('consentUploadName', '', { shouldValidate: true })
      return
    }
    if (!ACCEPTED.includes(file.type)) {
      fileRef.current = null
      setValue('consentUploadName', '')
      setError('consentUploadName', { message: 'fileType' })
      return
    }
    if (file.size > MAX_BYTES) {
      fileRef.current = null
      setValue('consentUploadName', '')
      setError('consentUploadName', { message: 'fileSize' })
      return
    }
    fileRef.current = file
    clearErrors('consentUploadName')
    setValue('consentUploadName', file.name, { shouldValidate: true })
  }

  return (
    <div>
      <label className="block text-base font-semibold text-inkt">{t('upload')}</label>
      <p className="mt-0.5 text-sm text-leisteen">{t('uploadHint')}</p>
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        onChange={onChange}
        className="mt-1.5 block w-full text-base text-inkt file:mr-3 file:rounded-md file:border file:border-lijn file:bg-mist file:px-3.5 file:py-2 file:text-sm file:font-medium file:text-inkt hover:file:bg-papier"
      />
      <ErrorText name="consentUploadName" />
    </div>
  )
}
