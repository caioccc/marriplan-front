import { FormEventHandler } from 'react'
import {
  Control,
  FieldValues,
  FormState,
  UseFormReturn,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'

export type isLoadingOptions = 'default' | 'loading' | 'success' | 'error'

export type FormValidation<T extends FieldValues> = {
  control: Control<T>
  handleSubmit?: FormEventHandler<HTMLFormElement>
  watch?: UseFormWatch<T>
  formState?: FormState<T>
  setValue?: UseFormSetValue<T>
  formValues?: T
  isLoading?: isLoadingOptions
}

export type FormHookValidation<T extends FieldValues> = {
  formReturn: UseFormReturn<T>
}
