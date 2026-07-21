import {
  TopicStats,
  TopicPartitionStats,
} from "../../infrastructure/kafka/kafka-topic-stats";
import { StatusResponse } from "../../infrastructure/fastify/schemas/status.schema";

export function toStatusResponse(stats: TopicStats[]): StatusResponse {
  return {
    topics: stats.map(toStatusTopic),
  };
}

function toStatusTopic(topic: TopicStats) {
  return {
    topic: topic.topic,
    partitions: topic.partitions.map(toStatusPartition),
  };
}

function toStatusPartition(partition: TopicPartitionStats) {
  return {
    partition: partition.partition,
    leader: partition.leader,
    replicas: partition.replicas,
    isr: partition.isr,
    offlineReplicas: partition.offlineReplicas,
    low: partition.low,
    high: partition.high,
    offset: partition.offset,
  };
}
