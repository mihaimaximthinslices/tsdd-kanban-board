import LogoDark from '../svg/logo-dark.tsx'
import IconEmail from '../svg/icon-email.tsx'
import IconPassword from '../svg/icon-password.tsx'
import GoogleLogo from '../svg/google-logo.tsx'
import LogoLight from '../svg/logo-light.tsx'

export const SignUpPage = () => {
  return (
    <div className="flex w-screen h-screen flex-col 1xl:bg-imageGray">
      <div className="hidden md:block 1xl:hidden w-full p-8 md:bg-googleButton">
        <div className="md:hidden">
          <LogoDark />
        </div>
        <div className="hidden md:block">
          <LogoLight />
        </div>
      </div>
      <div className="grow flex md:items-center justify-center">
        <img
          className="max-w-[960px] hidden 1xl:block rounded-l-xl "
          src="../../public/app-preview.jpg"
        ></img>
        <div className="flex-1 flex justify-center 1xl:max-w-[480px] 1xl:h-[704px] bg-white 1xl:rounded-r-xl">
          <div className="w-fit 1xl:mt-10">
            <div className="pb-16 pt-8 md:hidden">
              <div className="md:hidden">
                <LogoDark />
              </div>
              <div className="hidden md:block">
                <LogoLight />
              </div>
            </div>
            <div className="flex flex-col gap-2 mb-10">
              <h1 className="font-plusJSans text-headingXL">Create Account</h1>
              <span className="font-plusJSans text-headingM text-white4">
                Let’s get you started organizing your tasks!
              </span>
            </div>
            <form className="flex w-[311px] md:w-[395px] flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label
                  className="font-plusJSans text-headingM text-black1"
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
                  autoComplete="off"
                  data-cy="email-address-input"
                  className="pl-9 pt-2 pb-2 border rounded-md text-bodyL"
                  type="text"
                  id="email"
                  placeholder="eg. alex@gmail.com"
                />
                <div className="font-plusJSans text-headingS text-red2">
                  Field is required
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label
                  className="font-plusJSans text-headingM text-black1"
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
                  className="font-plusJSans pl-9 pt-2 pb-2 border rounded-md text-bodyL"
                  autoComplete="off"
                  data-cy="password-input"
                  type="password"
                  id="password"
                  placeholder="At least 8 characters"
                />
                <div className=" font-plusJSans text-headingS text-red2">
                  Field is required
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label
                  className="font-plusJSans text-headingM text-black1"
                  data-cy="confirmPassword-input-label"
                  htmlFor="confirmPassword"
                >
                  Confirm password
                </label>
                <div className="relative left-3 top-1">
                  <div className="absolute flex h-[37.3px] items-center justify-center">
                    <IconPassword />
                  </div>
                </div>

                <input
                  className="font-plusJSans pl-9 pt-2 pb-2 border rounded-md text-bodyL"
                  autoComplete="off"
                  data-cy="confirmPassword-input"
                  type="password"
                  id="confirmPassword"
                  placeholder="At least 8 characters"
                />
                <div className="relative -mt-2 mb-2">
                  <div className="flex justify-end absolute right-0 top-2">
                    <a
                      href="/reset-password"
                      className="font-plusJSans text-headingS text-systemBlue"
                    >
                      Forgot password?
                    </a>
                  </div>
                </div>
                <div className="font-plusJSans text-headingS text-red2 -mt-1">
                  Passwords do not match
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  data-cy="create-account-button"
                  className="font-plusJSans text-headingM bg-blue2 p-2 pt-[10px] pb-[10px] text-white rounded-md w-full hover:bg-blue1 flex items-center justify-center"
                >
                  Create new account
                </button>
              </div>

              <div className="flex flex-col items-center w-full">
                <hr className="border-gray2 mb-4 w-full" />
                <button className="font-plusJSans pt-[10px] pb-[10px] text-white text-headingS rounded-md w-full bg-googleButton hover:bg-blue1 flex items-center justify-center gap-2">
                  <div>
                    <GoogleLogo />
                  </div>
                  Or sign in with Google
                </button>
                <div className="flex w-full flex-col items-center justify-center gap-1 md:flex-row md:justify-around mt-4">
                  <p className="font-plusJSans text-headingM text-black1">
                    Already have an account?
                    <br className="md:hidden" />
                    <a
                      className="font-plusJSans text-headingM text-systemBlue hidden md:inline pl-1"
                      href="/sign-in"
                    >
                      Sign in
                    </a>
                  </p>
                  <a
                    className="font-plusJSans text-headingM text-systemBlue md:hidden"
                    href="/sign-in"
                  >
                    Sign in
                  </a>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
