import DispatchClient from './dispatch-client';

export default function DispatchPage() {
  return <DispatchClient lanModeEnabled={process.env.LAN_MODE === 'true'} />;
}
