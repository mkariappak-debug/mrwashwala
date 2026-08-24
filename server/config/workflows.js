export const WORKFLOWS = {
  washAndFold: {
    key: 'washAndFold',
    name: 'Wash & Fold',
    steps: [
      { id: 'washing', label: 'Washing', requiresQc: true, qcPrologue: 'Are the clothes properly washed and stains removed?' },
      { id: 'drying', label: 'Drying', requiresQc: true, qcPrologue: 'Are the clothes properly dry?' },
      { id: 'folding', label: 'Folding', requiresQc: true, qcPrologue: 'Are the clothes properly folded?' },
      { id: 'packaging', label: 'Packaging', requiresQc: false },
      { id: 'ready', label: 'Ready for Pickup / Delivery', requiresQc: false }
    ]
  },
  washAndIron: {
    key: 'washAndIron',
    name: 'Wash & Iron',
    steps: [
      { id: 'washing', label: 'Washing', requiresQc: true, qcPrologue: 'Are the clothes properly washed and stains removed?' },
      { id: 'drying', label: 'Drying', requiresQc: true, qcPrologue: 'Are the clothes properly dry?' },
      { id: 'ironing', label: 'Ironing', requiresQc: true, qcPrologue: 'Is the ironing completed properly without creases?' },
      { id: 'folding', label: 'Folding', requiresQc: true, qcPrologue: 'Are the clothes properly folded?' },
      { id: 'packaging', label: 'Packaging', requiresQc: false },
      { id: 'ready', label: 'Ready for Pickup / Delivery', requiresQc: false }
    ]
  },
  dryCleaning: {
    key: 'dryCleaning',
    name: 'Dry Cleaning',
    steps: [
      { id: 'inspection', label: 'Inspection / Tagging', requiresQc: false },
      { id: 'pretreatment', label: 'Pre-treatment', requiresQc: false },
      { id: 'dryCleaning', label: 'Dry Cleaning', requiresQc: true, qcPrologue: 'Are all garments perfectly cleaned?' },
      { id: 'pressing', label: 'Pressing / Finishing', requiresQc: true, qcPrologue: 'Is the pressing/finishing completed properly?' },
      { id: 'packaging', label: 'Packaging', requiresQc: false },
      { id: 'ready', label: 'Ready for Pickup / Delivery', requiresQc: false }
    ]
  },
  shoeCleaning: {
    key: 'shoeCleaning',
    name: 'Shoe Cleaning',
    steps: [
      { id: 'inspection', label: 'Inspection', requiresQc: false },
      { id: 'cleaning', label: 'Cleaning', requiresQc: false },
      { id: 'drying', label: 'Drying', requiresQc: true, qcPrologue: 'Are the shoes completely dry inside and out?' },
      { id: 'finishing', label: 'Finishing', requiresQc: false },
      { id: 'packaging', label: 'Packaging', requiresQc: false },
      { id: 'ready', label: 'Ready for Pickup / Delivery', requiresQc: false }
    ]
  },
  blanketCleaning: {
    key: 'blanketCleaning',
    name: 'Blanket / Bedsheet Cleaning',
    steps: [
      { id: 'washing', label: 'Washing', requiresQc: true, qcPrologue: 'Is the blanket/bedsheet completely clean?' },
      { id: 'drying', label: 'Drying', requiresQc: true, qcPrologue: 'Is the blanket/bedsheet completely dry?' },
      { id: 'folding', label: 'Folding', requiresQc: false },
      { id: 'packaging', label: 'Packaging', requiresQc: false },
      { id: 'ready', label: 'Ready for Pickup / Delivery', requiresQc: false }
    ]
  },
  default: {
    key: 'default',
    name: 'Standard Processing',
    steps: [
      { id: 'processing', label: 'Processing', requiresQc: true, qcPrologue: 'Is the service completed correctly?' },
      { id: 'packaging', label: 'Packaging', requiresQc: false },
      { id: 'ready', label: 'Ready for Pickup / Delivery', requiresQc: false }
    ]
  }
};

export const determineWorkflow = (serviceName) => {
  const name = serviceName.toLowerCase();
  if (name.includes('dry clean')) return WORKFLOWS.dryCleaning;
  if (name.includes('shoe')) return WORKFLOWS.shoeCleaning;
  if (name.includes('blanket') || name.includes('bedsheet') || name.includes('duvet')) return WORKFLOWS.blanketCleaning;
  if (name.includes('iron') && name.includes('wash')) return WORKFLOWS.washAndIron;
  if (name.includes('wash') || name.includes('laundry') || name.includes('kg')) return WORKFLOWS.washAndFold;
  return WORKFLOWS.default;
};
