{{/*
  _helpers.tpl — قوالب مشتركة بنستخدمها في كل الـ templates
  بنناديها بـ {{ include "storehub.xxx" . }}
*/}}

{{/* اسم الـ backend resource */}}
{{- define "storehub.backend.name" -}}
{{- printf "%s-backend" .Release.Name }}
{{- end }}

{{/* اسم الـ frontend resource */}}
{{- define "storehub.frontend.name" -}}
{{- printf "%s-frontend" .Release.Name }}
{{- end }}

{{/* Labels مشتركة بتتحط على كل resource — بتساعد في التتبع والـ filtering */}}
{{- define "storehub.labels" -}}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/instance: {{ .Release.Name }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
{{- end }}