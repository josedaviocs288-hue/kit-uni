# Kit-Uni

Protótipo de startup para estudantes encontrarem kitnets e moradias próximas de universidades, com opções de aluguel mensal, diária/noite, divisão de despesas e localização.

## Tecnologias

- HTML
- CSS
- JavaScript
- Geolocation API do navegador
- LocalStorage para dados demonstrativos

## Executar localmente

Você pode abrir o `index.html` diretamente. Para testar a localização com maior compatibilidade, use um servidor local:

```bash
python3 -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Hospedar no GitHub Pages

1. Crie um repositório no GitHub, por exemplo `kit-uni`.
2. Envie todos os arquivos desta pasta para a raiz do repositório.
3. No GitHub, abra **Settings > Pages**.
4. Em **Build and deployment**, escolha **Deploy from a branch**.
5. Selecione a branch **main** e a pasta **/(root)**.
6. Clique em **Save**.

Após o deploy, o site será servido por HTTPS e o botão de localização poderá solicitar a permissão do navegador normalmente.

> Este projeto é um protótipo demonstrativo. Os imóveis, usuários e demais dados usados na interface são fictícios.
