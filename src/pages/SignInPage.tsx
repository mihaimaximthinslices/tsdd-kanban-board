import LogoDark from '../svg/logo-dark.tsx'
import IconEmail from '../svg/icon-email.tsx'
import IconPassword from '../svg/icon-password.tsx'
import GoogleLogo from '../svg/google-logo.tsx'
import LogoLight from '../svg/logo-light.tsx'
import { useEffect, useState } from 'react'
import * as Yup from 'yup'
import { ValidationError } from 'yup'
import { clsx } from 'clsx'
import axios, { AxiosError } from 'axios'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useUser.tsx'

type SignInUserFormData = {
  email: string
  password: string
}

export const SignInPage: React.FC = () => {
  const navigate = useNavigate()

  const { refetch: refetchUser } = useUser()

  const [signInFormData, setSignInFormData] = useState({
    email: '',
    password: '',
  })

  const [errors, setSignInFormDataErrors] = useState(
    {} as Record<string, string>,
  )

  const [inputTouched, setInputTouched] = useState({
    email: false,
    password: false,
  })

  async function handleSubmit() {
    if (!(Object.values(errors).length === 0)) return
    try {
      await axios.post('/api/sign-in', signInFormData)
      refetchUser()
      navigate('/')
    } catch (err) {
      const error = err as AxiosError
      if (error.response!.status === 401) {
        setSignInFormDataErrors((old) => ({
          ...old,
          email: 'Please check again',
          password: 'Please check again',
        }))
      } else if (error.response!.status === 500) {
        setSignInFormDataErrors((old) => ({
          ...old,
          email: 'Server error, try again shortly',
        }))
      } else if (error.response!.status === 422) {
        setSignInFormDataErrors((old) => ({
          ...old,
          email: 'Account was configured to sign in with Google',
        }))
      }
    }
  }

  useEffect(() => {
    const validateSignInUserForm = async (
      SignInFormData: SignInUserFormData,
    ) => {
      const localErrors: Record<string, string> = {}
      const SignInUserFormValidationSchema = Yup.object().shape({
        email: Yup.string()
          .email('Invalid email address')
          .required("Can't be empty"),
        password: Yup.string().required("Can't be empty"),
      })

      await SignInUserFormValidationSchema.validate(SignInFormData, {
        abortEarly: false,
      }).catch((err) => {
        err.inner.forEach((error: ValidationError) => {
          localErrors[error.path!] = error.message
        })
      })
      setSignInFormDataErrors(localErrors)
    }

    validateSignInUserForm(signInFormData)
  }, [signInFormData])

  return (
    <div className="flex w-screen h-screen flex-col 1xl:bg-imageGray 1xl:dark:bg-black3">
      <div className="hidden md:block 1xl:hidden w-full p-8 bg-white border border-b-white3 dark:border-none dark:bg-black2">
        <div data-cy="kanban-app-logo" className="block dark:hidden ">
          <LogoDark />
        </div>
        <div
          data-cy="kanban-app-logo"
          className="hidden md:hidden dark:md:block"
        >
          <LogoLight />
        </div>
      </div>
      <div className="grow flex 1xl:items-center justify-center">
        <img
          data-cy="app-preview-image"
          className="max-w-[960px] hidden 1xl:block rounded-l-xl "
          src="../../public/app-preview.jpg"
        ></img>
        <div className="md:mt-5 flex-1 flex justify-center 1xl:max-w-[480px] 1xl:h-[704px]  1xl:rounded-r-xl 1xl:mt-0 bg-white2 dark:bg-black2 md:dark:bg-black3 1xl:bg-white 1xl:dark:bg-black2">
          <div className="w-fit ">
            <div className="pb-16 pt-8 md:hidden">
              <div className="dark:hidden md:hidden">
                <LogoDark />
              </div>
              <div className="hidden dark:block md:block">
                <LogoLight />
              </div>
            </div>
            <div className="dark:bg-black2 md:p-8 md:bg-white md:border md:border-white3 dark:border-none 1xl:border-none md:rounded-md 1xl:mt-4">
              <div className="flex flex-col gap-2 mb-10">
                <h1 className="font-plusJSans text-headingXL dark:text-white">
                  Welcome Back 👋
                </h1>
                <span className="font-plusJSans text-headingM text-white4 max-w-[311px] md:max-w-[395px]">
                  Add your details below to access your tasks!
                </span>
              </div>
              <form
                data-cy="sign-in-form"
                className="flex w-[311px] md:w-[395px] flex-col gap-4"
                onSubmit={(e) => {
                  setInputTouched({
                    email: true,
                    password: true,
                  })
                  e.preventDefault()
                  handleSubmit()
                }}
              >
                <div className="flex flex-col gap-1">
                  <label
                    className="font-plusJSans text-headingM text-black1 dark:text-white"
                    data-cy="email-address-input-label"
                    htmlFor="email"
                  >
                    Email address
                  </label>

                  <div className="relative left-3 top-1 ">
                    <div className="absolute flex h-[37.3px] items-center justify-center">
                      <IconEmail />
                    </div>
                  </div>

                  <input
                    onChange={(e) => {
                      setSignInFormData((old) => ({
                        ...old,
                        email: e.target.value,
                      }))
                    }}
                    onBlur={() =>
                      setInputTouched((old) => ({
                        ...old,
                        email: true,
                      }))
                    }
                    data-cy="email-address-input"
                    className={clsx(
                      'pl-9 pt-2 pb-2 border rounded-md text-bodyL dark:bg-black2 dark:text-white dark:border-white4',
                      errors.email &&
                        inputTouched.email &&
                        'focus:outline-redH outline outline-red2 outline-1',
                    )}
                    type="text"
                    id="email"
                    placeholder="eg. alex@gmail.com"
                  />
                  {errors.email && inputTouched.email && (
                    <div className="font-plusJSans text-headingS text-red2">
                      <span>{errors.email}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    className="font-plusJSans text-headingM text-black1 dark:text-white"
                    data-cy="password-input-label"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <div className="relative left-3 top-1">
                    <div className="absolute flex h-[37.3px] items-center justify-center">
                      <IconPassword />
                    </div>
                  </div>

                  <input
                    onChange={(e) => {
                      setSignInFormData((old) => ({
                        ...old,
                        password: e.target.value,
                      }))
                    }}
                    onBlur={() =>
                      setInputTouched((old) => ({
                        ...old,
                        password: true,
                      }))
                    }
                    className={clsx(
                      'font-plusJSans pl-9 pt-2 pb-2 border rounded-md text-bodyL dark:bg-black2 dark:text-white dark:border-white4',
                      errors.password &&
                        inputTouched.password &&
                        'focus:outline-redH outline outline-red2 outline-1',
                    )}
                    data-cy="password-input"
                    type="password"
                    id="password"
                    placeholder="At least 8 characters"
                  />
                  {errors.password && inputTouched.password && (
                    <div className=" font-plusJSans text-headingS text-red2">
                      <span>{errors.password}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    data-cy="sign-in-account-button"
                    className="font-plusJSans text-headingM bg-blue2 p-2 pt-[10px] pb-[10px] text-white rounded-md w-full hover:bg-blue1 flex items-center justify-center"
                  >
                    Sign in
                  </button>
                </div>
              </form>
              <hr className="border-gray2 mb-4 w-full mt-4 dark:border-black1" />
              <div className="flex flex-col items-center w-full">
                <a
                  href={`${import.meta.env.VITE_HOST_BE}/api/auth/google`}
                  data-cy="sign-in-with-google-button"
                  className="font-plusJSans pt-[10px] pb-[10px] text-white text-headingS rounded-md w-full bg-googleButton hover:bg-blue1 flex items-center justify-center gap-2"
                >
                  <div>
                    <GoogleLogo />
                  </div>
                  Or sign in with Google
                </a>
                <div className="flex w-full flex-col items-center justify-center gap-1 md:flex-row md:justify-around mt-4">
                  <p className="font-plusJSans text-headingM text-black1 dark:text-white">
                    Don't have an account?
                    <br className="md:hidden" />
                    <a
                      className="font-plusJSans text-headingM text-systemBlue hidden md:inline pl-1"
                      href="/sign-up"
                    >
                      Sign up
                    </a>
                  </p>
                  <a
                    className="font-plusJSans text-headingM text-systemBlue md:hidden"
                    href="/sign-up"
                  >
                    Sign up
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
