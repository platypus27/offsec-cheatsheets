import type { ScannedPort } from '../lib/nmap'

/** Compact port listing; open ports read strongest so they stand out from filtered or closed ones. */
export function PortsTable({ ports, caption }: { ports: ScannedPort[]; caption: string }) {
  if (ports.length === 0) return <p className="text-sm text-teal-on-surface-variant">No ports recorded.</p>
  return (
    <div className="table-wrap">
      <table>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Port</th>
            <th scope="col">State</th>
            <th scope="col">Service</th>
            <th scope="col">Version</th>
          </tr>
        </thead>
        <tbody>
          {ports.map((port) => {
            const open = port.state.startsWith('open')
            return (
              <tr key={`${port.port}/${port.protocol}`} className={open ? undefined : 'text-teal-on-surface-variant'}>
                <td className="whitespace-nowrap font-mono">
                  {port.port}/{port.protocol}
                </td>
                <td className={open ? 'font-semibold text-teal-tertiary' : undefined}>{port.state}</td>
                <td className="font-mono">{port.service}</td>
                <td className="break-words">{port.version}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
