Doto variable and Hind Siliguri 500/700 WOFF2 fonts from @fontsource-variable/doto@5.3.0 and @fontsource/hind-siliguri@5.3.0. Original font copyright notices and SIL Open Font License texts are included in Doto-LICENSE.txt and Hind-Siliguri-LICENSE.txt. Fonts are served locally; no Google Fonts request is needed.

brand.css is the shared font declaration sheet linked by every HTML page. Doto is the Latin brand font; Hind Siliguri supplies Bengali glyphs. Relative font URLs support both the custom domain and the GitHub Pages project prefix.

The two Hind Siliguri Bengali files are subset to the Bengali characters the site uses (অপূর্ব plus joiners and danda), about 5 KB each instead of 73 KB. When new Bengali text is added anywhere, re-subset from @fontsource/hind-siliguri 5.3.0 with:
  pyftsubset <original>.woff2 --text="<all Bengali characters used>।॥" --unicodes="U+200C,U+200D,U+25CC" --layout-features='*' --flavor=woff2
