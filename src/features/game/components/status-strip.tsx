import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../../components/ui/alert"

interface StatusStripProps {
  error: string
  isInitialized: boolean
}

export function StatusStrip({ error, isInitialized }: StatusStripProps) {
  if (!error && isInitialized) {
    return null
  }

  return (
    <div className="space-y-2">
      {error && (
        <Alert variant="destructive" className="rounded-2xl border-destructive/25 bg-destructive/8 backdrop-blur-sm">
          <AlertTitle>系统同步异常</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isInitialized && !error && (
        <Alert className="rounded-2xl border-violet-400/20 bg-violet-500/[0.04] text-violet-100">
          <AlertTitle>待开局</AlertTitle>
          <AlertDescription className="text-violet-200/80">
            古堡仍在候场，请回到大厅开始新局完成首次发牌。
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
