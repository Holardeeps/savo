import React from 'react'

const HeaderBox = ({ type = "title", title, subtext, user}: HeaderBoxProps) => {
  return (
    <div className="flex flex-col gap-1">
        <h1 className="text-2xl lg:text-[30px] font-semibold text-gray-900">
            {title}
            {type === "greeting" && (
                <span className="text-bankGradient">
                    &nbsp;{user}
                </span>
            )}
        </h1>
        <p className="text-[14px] lg:text-[16px] font-normal text-gray-600">{subtext}</p>
    </div>
  )
}

export default HeaderBox
