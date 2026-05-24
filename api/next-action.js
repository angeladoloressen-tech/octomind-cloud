export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  const state = {
    deploy: false,
    storage: false,
    traffic: false,
    named_target: false,
    revenue: false
  };

  const next = !state.deploy
    ? 'connect_deploy_target'
    : !state.storage
      ? 'connect_storage'
      : !state.traffic
        ? 'prepare_first_channel'
        : !state.named_target
          ? 'select_named_target'
          : !state.revenue
            ? 'convert_first_payment'
            : 'deliver_and_support';

  return res.status(200).json({
    ok: true,
    mode: 'next_action_runtime',
    state,
    next,
    loop: 'observe_decide_act_verify_learn'
  });
}
