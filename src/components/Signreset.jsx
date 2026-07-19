import { mediaData } from "../utils/mediaData";
export const Signreset = ({ centerHeading, children, contentOffsetClassName = "" }) => {
  return (
    <div className="w-full min-h-screen lg:h-screen flex flex-col lg:flex-row bg-white lg:overflow-hidden">
      <div className="w-full h-64 lg:h-full lg:w-1/2 relative shrink-0">
        <img
          src={mediaData.Rightimage}
          alt="Union Hub site preview"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
        <div className="absolute top-6 left-6 lg:top-10 lg:left-10 flex items-center gap-3">
          <img
            src={mediaData.Logo}
            alt="Logo"
            className="w-12 h-12 rounded-full bg-white/80 p-1 object-contain"
          />
          <h2 className="text-2xl font-semibold text-white font-montserrat tracking-wide">
            Union Hub
          </h2>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 lg:px-16 pt-8 pb-4 lg:pt-16 lg:pb-6 overflow-y-auto
        [&::-webkit-scrollbar]:w-2
        [&::-webkit-scrollbar-track]:bg-gray-100
        [&::-webkit-scrollbar-thumb]:bg-gray-300
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb:hover]:bg-gray-400
      ">
        <div className={`w-full max-w-md ${contentOffsetClassName}`.trim()}>
          <div className="hidden items-center gap-3 mb-8">
            <img
              src={mediaData.Logo}
              alt="Logo"
              className="w-10 h-10 rounded-full bg-white/80 p-1 object-contain"
            />
            <h2 className="text-xl font-semibold text-primary font-montserrat tracking-wide">
              Union Hub
            </h2>
          </div>

          <h1 className="text-3xl sm:text-[32px] font-bold mb-6 text-gray-700 font-montserrat text-center">
            {centerHeading}
          </h1>

          <div className="w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
