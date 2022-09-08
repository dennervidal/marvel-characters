import React from 'react'
import { Head, Html, Main, NextScript } from 'next/document'

const Document = () => {
  return (
    <Html>
      <Head>
        <meta charSet='utf-8' />
        <link rel='icon' type='image/png' sizes='32x32' href='/favicon.png' />
        <meta name='theme-color' content='#000000' />
        <meta name='description' content='marvel characters database' />
        <link rel='manifest' href='/manifest.json' />
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='true'
        />
        <link
          href='https://fonts.googleapis.com/css2?family=PT+Sans&family=PT+Sans+Caption&display=swap'
          rel='stylesheet'
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

export default Document
