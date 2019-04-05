
const GLOBAL_DEFINITION = {
    "services": {
        "order_store": {
            "in": "OrderStoreReq.NEW",
            "out": [],
            "pos": {
                "x": 1540,
                "y": -127
            }
        },
        "customer_store": {
            "in": "CustomerStoreReq.NEW",
            "out": [],
            "pos": {
                "x": 1536,
                "y": -27
            }
        },
        "order_new_digest": {
            "in": "Order.NEW",
            "out": [
                "Order.VERIFY",
                "OrderStoreReq.NEW"
            ],
            "pos": {
                "x": -81,
                "y": 149
            }
        },
        "order_verify_dispatch": {
            "in": "Order.VERIFY",
            "out": [
                "Order.VERIFICATION",
                "OrderVerifyAddressReq.NEW",
                "OrderVerifyPaymentReq.NEW",
                "OrderStockReservationReq.NEW"
            ],
            "pos": {
                "x": 226,
                "y": 136
            }
        },
        "order_verify_address": {
            "in": "OrderVerifyAddressReq.NEW",
            "out": [
                "OrderVerification.OK",
                "OrderVerification.FAILED"
            ],
            "pos": {
                "x": 646,
                "y": 88
            }
        },
        "order_verify_payment": {
            "in": "OrderVerifyPaymentReq.NEW",
            "out": [
                "OrderVerification.OK",
                "OrderVerification.FAILED"
            ],
            "pos": {
                "x": 644,
                "y": 200
            }
        },
        "order_stock_reservation": {
            "in": "OrderStockReservationReq.NEW",
            "out": [
                "OrderVerification.OK",
                "OrderVerification.FAILED"
            ],
            "unit": "StockReservation",
            "pos": {
                "x": 628,
                "y": 309
            }
        },
        "order_verification_digest": {
            "in": "OrderVerification.OK",
            "out": [
                "Order.TO_SHIP",
                "OrderStoreReq.NEW",
                "CustomerStoreReq.NEW",
                "ChannelFeedbackReq.NEW"
            ],
            "pos": {
                "x": 1094,
                "y": 196
            }
        },
        "channel_feedback": {
            "in": "ChannelFeedbackReq.NEW",
            "out": [],
            "pos": {
                "x": 1547,
                "y": -296
            }
        },
        "order_support_store": {
            "in": "OrderVerification.FAILED",
            "out": [
                "OrderChangeReq.NEW",
                "OrderCancelReq.NEW"
            ],
            "pos": {
                "x": 1090,
                "y": 530
            }
        },
        "order_change": {
            "in": "OrderChangeReq.NEW",
            "out": [
                "Order.NEW",
                "OrderCancelReq.NEW"
            ],
            "pos": {
                "x": -114,
                "y": 517
            }
        },
        "order_shipment_create": {
            "in": "Order.TO_SHIP",
            "out": [
                "ShipmentReq.NEW"
            ],
            "pos": {
                "x": 1505,
                "y": 196
            }
        },
        "shipment_batch_create": {
            "in": "ShipmentReq.NEW",
            "out": [
                "ShipmentBatch.NEW"
            ],
            "pos": {
                "x": 1856,
                "y": 187
            }
        }
    },
    "diagram": {
        "offsetX": 62.87594534130957,
        "offsetY": 159.87127796113433,
        "zoom": 31.3682581159366
    }
};

export default GLOBAL_DEFINITION