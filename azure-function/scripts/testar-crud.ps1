# Exercita as quatro Azure Functions em sequencia e imprime a resposta de cada
# uma. Serve como teste de fumaca e como evidencia textual da atividade.
#
#   Local:     .\scripts\testar-crud.ps1
#   Publicado: .\scripts\testar-crud.ps1 -Base "https://func-milscale-1234.azurewebsites.net/api"

param(
  [string]$Base = "http://localhost:7071/api"
)

$ErrorActionPreference = "Stop"

# O Windows PowerShell nao usa UTF-8 por padrao e trocaria os acentos na tela.
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# Fala com as Functions tratando UTF-8 nas duas pontas. Sem isto o PowerShell
# 5.1 re-codifica o corpo enviado e le a resposta como ISO-8859-1, porque o
# Azure Functions nao declara charset no cabecalho Content-Type.
function Invoke-Api {
  param(
    [string]$Url,
    [string]$Metodo = "Get",
    [string]$Corpo
  )

  $parametros = @{
    Uri             = $Url
    Method          = $Metodo
    UseBasicParsing = $true
  }

  if ($Corpo) {
    $parametros.Body = [System.Text.Encoding]::UTF8.GetBytes($Corpo)
    $parametros.ContentType = "application/json; charset=utf-8"
  }

  $resposta = Invoke-WebRequest @parametros
  $resposta.RawContentStream.Position = 0
  $texto = [System.Text.Encoding]::UTF8.GetString($resposta.RawContentStream.ToArray())
  return $texto | ConvertFrom-Json
}

function Escrever-Passo($titulo) {
  Write-Host ""
  Write-Host "=== $titulo ===" -ForegroundColor Cyan
}

$servico = [ordered]@{
  posto      = "1º TEN"
  nome       = "TESTE"
  circulo    = "oficial"
  funcao     = "Oficial de Dia"
  data       = "2026-09-30"
  subunidade = "1ª Cia Fuz"
}

try {
  Escrever-Passo "1/4  INSERIR  ->  POST $Base/InserirEscala"
  $criado = Invoke-Api -Url "$Base/InserirEscala" -Metodo Post -Corpo ($servico | ConvertTo-Json)
  $criado | ConvertTo-Json -Depth 5
  $id = $criado.servico.id
  Write-Host "id gerado pelo MongoDB: $id" -ForegroundColor Green

  Escrever-Passo "2/4  PESQUISAR  ->  GET $Base/PesquisarEscala?termo=TESTE"
  $encontrados = Invoke-Api -Url "$Base/PesquisarEscala?termo=TESTE"
  Write-Host "$($encontrados.escala.Count) serviço(s) encontrado(s)." -ForegroundColor Green
  $encontrados.escala | ConvertTo-Json -Depth 5

  Escrever-Passo "3/4  ALTERAR  ->  PUT $Base/AlterarEscala?id=$id"
  $servico.funcao = "Adjunto ao Oficial de Dia"
  $alterado = Invoke-Api -Url "$Base/AlterarEscala?id=$id" -Metodo Put -Corpo ($servico | ConvertTo-Json)
  $alterado | ConvertTo-Json -Depth 5

  Escrever-Passo "4/4  EXCLUIR  ->  DELETE $Base/ExcluirEscala?id=$id"
  $excluido = Invoke-Api -Url "$Base/ExcluirEscala?id=$id" -Metodo Delete
  $excluido | ConvertTo-Json -Depth 5

  Write-Host ""
  Write-Host "As quatro Azure Functions responderam corretamente." -ForegroundColor Green
}
catch {
  Write-Host ""
  Write-Host "FALHOU: $($_.Exception.Message)" -ForegroundColor Red
  if ($_.ErrorDetails.Message) {
    Write-Host $_.ErrorDetails.Message -ForegroundColor Red
  }
  exit 1
}
