export type VariantProps<T extends (...args: any) => any> = Parameters<T>[0]

export function cva(
  base: string,
  config?: {
    variants?: Record<string, Record<string, string>>
    defaultVariants?: Record<string, string>
  },
) {
  return (props?: Record<string, string | undefined>) => {
    let classes = base

    if (config?.variants && props) {
      Object.entries(props).forEach(([key, value]) => {
        if (value && config.variants?.[key]?.[value]) {
          classes += " " + config.variants[key][value]
        }
      })
    }

    if (config?.defaultVariants && props) {
      Object.entries(config.defaultVariants).forEach(([key, defaultValue]) => {
        if (props[key] === undefined && config.variants?.[key]?.[defaultValue]) {
          classes += " " + config.variants[key][defaultValue]
        }
      })
    }

    return classes
  }
}
